package com.h102;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Debug;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.util.Log;
import android.widget.Toast;

import com.firebase.ui.auth.AuthUI;
import com.firebase.ui.auth.BuildConfig;
import com.firebase.ui.auth.ErrorCodes;
import com.firebase.ui.auth.IdpResponse;
import com.firebase.ui.auth.ResultCodes;
import com.google.android.gms.appinvite.AppInvite;
import com.google.android.gms.appinvite.AppInviteInvitationResult;
import com.google.android.gms.appinvite.AppInviteReferral;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigValue;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import cz.msebera.android.httpclient.NameValuePair;
import cz.msebera.android.httpclient.client.utils.URLEncodedUtils;

/**
 * Created by nick on 1/20/17.
 */

public class FirebaseWrapper {
    private static final String TAG = FirebaseWrapper.class.getSimpleName();
    private static final int RC_SIGN_IN = 123;

    public static AppActivity activity;

    private static GoogleApiClient mGoogleApiClient = null;

    private static String configFetchedSuccessfully = "false";

    private static String configJsonString = "";

    private static FirebaseRemoteConfig remoteConfig = null;

    public static boolean isLoggedIn() {
        FirebaseAuth auth = FirebaseAuth.getInstance();
        return auth.getCurrentUser() != null;
    }

    public static void login() {
        Intent intent = AuthUI.getInstance()
                .createSignInIntentBuilder()
                .setProviders(Arrays.asList(
                        new AuthUI.IdpConfig.Builder(AuthUI.EMAIL_PROVIDER).build(),
                        new AuthUI.IdpConfig.Builder(AuthUI.GOOGLE_PROVIDER).build(),
                        new AuthUI.IdpConfig.Builder(AuthUI.FACEBOOK_PROVIDER).build()
//                        new AuthUI.IdpConfig.Builder(AuthUI.TWITTER_PROVIDER).build()
                ))
                .setIsSmartLockEnabled(false).build();
        activity.startActivityForResult(intent, RC_SIGN_IN);
    }

    public static void logout() {
        AuthUI.getInstance()
                .signOut(activity)
                .addOnCompleteListener(new OnCompleteListener<Void>() {
                    public void onComplete(@NonNull Task<Void> task) {
                        // user is now signed out
                        Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onLoggedOut')");

                    }
                });
    }

    public static String getUserInfo() {
        if (!isLoggedIn())
            return null;

        FirebaseUser user =  FirebaseAuth.getInstance().getCurrentUser();
        JSONObject json = new JSONObject();
        try {
            json.put("name", user.getDisplayName());
            json.put("email", user.getEmail());
            json.put("photoUrl", user.getPhotoUrl());
            json.put("uid", user.getUid());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return json.toString();
    }

    public static void setData(String path, String values) {
        Gson gson = new GsonBuilder().create();
        Object data;
        try {
            data = gson.fromJson(values, new TypeToken<HashMap<String, Object>>() {}.getType());
        } catch (Exception e) {
            try {
                data = gson.fromJson(values, new TypeToken<ArrayList<Object>>() {}.getType());
            } catch (Exception e1) {
                data = values;
            }
        }

        DatabaseReference root = FirebaseDatabase.getInstance().getReference();
        DatabaseReference child = root.child(path);
        child.setValue(data);
    }

    public static void updateChildValues(String path, String values) {
        Gson gson = new GsonBuilder().create();
        HashMap<String, Object> data;
        try {
            data = gson.fromJson(values, new TypeToken<HashMap<String, Object>>() {}.getType());

            DatabaseReference root = FirebaseDatabase.getInstance().getReference();
            DatabaseReference child = root.child(path);
            child.updateChildren(data);
        } catch (Exception e) {
            Log.e(TAG, "Cant convert to map");
        }
    }

    public static void setInteger(String path, int value) {
        DatabaseReference root = FirebaseDatabase.getInstance().getReference();
        DatabaseReference child = root.child(path);
        child.setValue(value);
    }

    public static void setFloat(String path, float value) {
        DatabaseReference root = FirebaseDatabase.getInstance().getReference();
        DatabaseReference child = root.child(path);
        child.setValue(value);
    }

    public static void fetchData(final String path) {
        Log.d(TAG, "fetchData: " + path);
        DatabaseReference root = FirebaseDatabase.getInstance().getReference();
        final DatabaseReference child = root.child(path);

        child.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(final DataSnapshot dataSnapshot) {
                String dataString = "{}";
                if (dataSnapshot.exists()) {
                    if (dataSnapshot.getValue() instanceof ArrayList || dataSnapshot.getValue() instanceof Map) {
                        Gson gson = new Gson();
                        dataString = gson.toJson(dataSnapshot.getValue());
                    } else
                        dataString = dataSnapshot.getValue().toString();
                }
//                Log.d()

                final String finalDataString = dataString;
                activity.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString(String.format("NativeHelper.onReceive('Firebase', 'onFetchedData', ['%s', '%s', %s, '%s'])", child.getKey(), finalDataString, !dataSnapshot.exists() ? "true" : "false", path));
                    }
                });
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {

            }
        });
    }

    public static String createChildAutoId(String path) {
        return FirebaseDatabase.getInstance().getReference().child(path).push().getKey();
    }

    public static void onActivityResult(int requestCode, int resultCode, Intent data) {
        Log.d(TAG, requestCode + " " + resultCode);

        if (requestCode == RC_SIGN_IN) {
            IdpResponse response = IdpResponse.fromResultIntent(data);

            // Successfully signed in
            if (resultCode == ResultCodes.OK) {
                activity.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onLoggedIn', [true, null])");
                    }
                });
                return;
            } else {
                // Sign in failed
                if (response == null) {
                    // User pressed back button
                    activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onLoggedIn', [false, null])");
                        }
                    });
                    return;
                }

                if (response.getErrorCode() == ErrorCodes.NO_NETWORK) {
                    activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onLoggedIn', [false, 'NO_NETWORK'])");
                        }
                    });
                    Toast toast = Toast.makeText(activity, "Cannot login. Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                    return;
                }

                if (response.getErrorCode() == ErrorCodes.UNKNOWN_ERROR) {
                    activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onLoggedIn', [false, 'UNKNOWN_ERROR'])");
                        }
                    });
                    Toast toast = Toast.makeText(activity, "Login failed. Please try again later", Toast.LENGTH_LONG);
                    toast.show();
                    return;
                }
            }
        }
    }

    public static void setupDeepLinkListener() {
        Log.d(TAG, "setupDeepLinkListener");
        // ...

        // Build GoogleApiClient with AppInvite API for receiving deep links
        mGoogleApiClient = new GoogleApiClient.Builder(activity)
//                .enableAutoManage(activity, activity)
                .addApi(AppInvite.API)
                .addConnectionCallbacks(activity)
                .build();

        // Check if this app was launched from a deep link. Setting autoLaunchDeepLink to true
        // would automatically launch the deep link if one is found.
        boolean autoLaunchDeepLink = false;
        AppInvite.AppInviteApi.getInvitation(mGoogleApiClient, activity, autoLaunchDeepLink)
                .setResultCallback(
                        new ResultCallback<AppInviteInvitationResult>() {
                            @Override
                            public void onResult(@NonNull AppInviteInvitationResult result) {
                                if (result.getStatus().isSuccess()) {
                                    // Extract deep link from Intent
                                    Intent intent = result.getInvitationIntent();
                                    String deepLink = AppInviteReferral.getDeepLink(intent);
                                    Log.d(TAG, "deep link: " + deepLink);
                                    Uri url = Uri.parse(deepLink);
                                    Set<String> paramNames = url.getQueryParameterNames();
                                    Log.d(TAG, paramNames.toString());
                                    for (String key : paramNames) {
                                        Log.d(TAG, "key = " + key);
                                        if (key.equals("inviter_id")) {
                                            final String inviterId = url.getQueryParameter(key);
                                            activity.runOnGLThread(new Runnable() {
                                                @Override
                                                public void run() {
                                                    Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onGameStartedFromDeeplink', ['" + inviterId + "'])");
                                                }
                                            });
                                            break;
                                        }
                                    }

                                } else {
                                    Log.d(TAG, "getInvitation: no deep link found.");
                                }
                            }
                        });
    }

    public static void fetchConfig(String duration) {
        remoteConfig.fetch(Long.parseLong(duration)).addOnCompleteListener(activity, new OnCompleteListener<Void>() {

            @Override
            public void onComplete(@NonNull Task<Void> task) {

                configFetchedSuccessfully = "false";
                configJsonString = "{}";

                if (task.isSuccessful()) {
                    configFetchedSuccessfully = "true";
                    remoteConfig.activateFetched();
                }

                Set<String> configsKey = remoteConfig.getKeysByPrefix(null);
                Log.d(TAG, "configsKey == " + configsKey.toString());

                HashMap<String, String> configs = new HashMap<String, String>();
                for (String key: configsKey) {
                    configs.put(key, remoteConfig.getString(key));
                }
                Log.d(TAG, "configs = " + configs.toString());
                configJsonString = new Gson().toJson(configs);
                Log.d(TAG, "configJsonString == " + configJsonString);
                activity.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', " +
                                "'onFetchedConfig', [" + configFetchedSuccessfully + ", '" + configJsonString + "'])");
                    }
                });
            }
        });
    }

    public static void onActivityStart() {
        mGoogleApiClient.connect();
        remoteConfig = FirebaseRemoteConfig.getInstance();
        FirebaseRemoteConfigSettings configSettings = new FirebaseRemoteConfigSettings.Builder()
                .setDeveloperModeEnabled(BuildConfig.DEBUG)
                .build();
        remoteConfig.setConfigSettings(configSettings);
    }

    public static void onActivityStop() {
        mGoogleApiClient.disconnect();
    }


    public static void logEventLevelUp(String level) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.LEVEL, level);
        FirebaseAnalytics.getInstance(activity).logEvent(FirebaseAnalytics.Event.LEVEL_UP, bundle);
    }

    public static void logEventSelectContent(String contentType, String itemId) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.CONTENT_TYPE, contentType);
        bundle.putString(FirebaseAnalytics.Param.ITEM_ID, itemId);
        FirebaseAnalytics.getInstance(activity).logEvent(FirebaseAnalytics.Event.SELECT_CONTENT, bundle);
    }

    public static void logEventPostScore(String score, String level, String character) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.SCORE, score);
        bundle.putString(FirebaseAnalytics.Param.LEVEL, level);
        bundle.putString(FirebaseAnalytics.Param.CHARACTER, character);
        FirebaseAnalytics.getInstance(activity).logEvent(FirebaseAnalytics.Event.POST_SCORE, bundle);
    }

    public static void logEventSpendVirtualCurrency(String itemName, String virtualCurrencyName, String value) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.ITEM_NAME, itemName);
        bundle.putString(FirebaseAnalytics.Param.VIRTUAL_CURRENCY_NAME, virtualCurrencyName);
        bundle.putString(FirebaseAnalytics.Param.VALUE, value);
        FirebaseAnalytics.getInstance(activity).logEvent(FirebaseAnalytics.Event.SPEND_VIRTUAL_CURRENCY, bundle);
    }

    public static void logEventShare(String contentType, String itemId) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.CONTENT_TYPE, contentType);
        bundle.putString(FirebaseAnalytics.Param.ITEM_ID, itemId);
        FirebaseAnalytics.getInstance(activity).logEvent(FirebaseAnalytics.Event.SHARE, bundle);
    }

    public static void logEventAppOpen() {
        Bundle bundle = new Bundle();
        FirebaseAnalytics.getInstance(activity).logEvent(FirebaseAnalytics.Event.APP_OPEN, bundle);
    }
}
