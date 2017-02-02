package com.h102;

import android.content.Intent;
import android.support.annotation.NonNull;
import android.util.Log;

import com.firebase.ui.auth.AuthUI;
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
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by nick on 1/20/17.
 */

public class FirebaseWrapper {
    private static final String TAG = FirebaseWrapper.class.getSimpleName();
    private static final int RC_SIGN_IN = 123;

    public static AppActivity activity;

    private static GoogleApiClient mGoogleApiClient = null;

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
                )).build();
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

    public static void fetchData(String path) {
        Log.d(TAG, "fetchData: " + path);
        DatabaseReference root = FirebaseDatabase.getInstance().getReference();
        final DatabaseReference child = root.child(path);

        child.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                String dataString = "{}";
                if (dataSnapshot.exists()) {
                    if (dataSnapshot.getValue() instanceof ArrayList || dataSnapshot.getValue() instanceof Map) {
                        Gson gson = new Gson();
                        dataString = gson.toJson(dataSnapshot.getValue());
                    } else
                        dataString = dataSnapshot.getValue().toString();
                }

                final String finalDataString = dataString;
                activity.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString(String.format("NativeHelper.onReceive('Firebase', 'onFetchedData', ['%s, '%s])", child.getKey(), finalDataString));
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
                    return;
                }

                if (response.getErrorCode() == ErrorCodes.UNKNOWN_ERROR) {
                    activity.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString("NativeHelper.onReceive('Firebase', 'onLoggedIn', [false, 'UNKNOWN_ERROR'])");
                        }
                    });
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

                                    // Handle the deep link. For example, open the linked
                                    // content, or apply promotional credit to the user's
                                    // account.

                                    // ...
                                } else {
                                    Log.d(TAG, "getInvitation: no deep link found.");
                                }
                            }
                        });
    }

    public static void onActivityStart() {
        mGoogleApiClient.connect();
    }

    public static void onActivityStop() {
        mGoogleApiClient.disconnect();
    }
}
