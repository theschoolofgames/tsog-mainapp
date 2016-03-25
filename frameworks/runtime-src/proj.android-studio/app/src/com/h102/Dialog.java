package com.h102;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.view.WindowManager;

import com.hub102.tsog.R;

/**
 * Created by nick on 3/25/16.
 */
public class Dialog {

    public static final String ROOT_PLAY_STORE_DEVICE = "market://details?id=";
    public static final String PREFS_FILENAME = "updateChecker";
    public static final String DONT_SHOW_AGAIN_PREF_KEY = "dontShow";

    public static void show(final Context context, final String versionDownloadable, final int dialogIconResId, final boolean forceUpdate) {
        try {
            String storeName = "Google Play";
            AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(context);
            String appName = null;
            try {
                appName = (String) context.getPackageManager().getApplicationLabel(context.getPackageManager().getApplicationInfo(context.getPackageName(), 0));
            } catch (PackageManager.NameNotFoundException ignored) {
            }
            alertDialogBuilder.setTitle(context.getResources().getString(R.string.newUpdateAvailable));
            alertDialogBuilder.setMessage(context.getResources().getString(R.string.downloadFor, appName, storeName))
                    .setCancelable(forceUpdate)
                    .setPositiveButton(context.getString(R.string.dialogPositiveButton), new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            goToMarket(context);
                            dialog.cancel();
                        }
                    });
            if (!forceUpdate) {
                alertDialogBuilder
                        .setNeutralButton(context.getString(R.string.dialogNeutralButton), new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                dialog.cancel();
                            }
                        })
                        .setNegativeButton(context.getString(R.string.dialogNegativeButton), new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                userHasTappedToNotShowNoticeAgain(context, versionDownloadable);
                                dialog.cancel();
                            }

                        });
            }
            if (dialogIconResId != 0) {
                alertDialogBuilder.setIcon(dialogIconResId);
            }
            AlertDialog alertDialog = alertDialogBuilder.create();
            alertDialog.show();
        } catch (NullPointerException e) {
            e.printStackTrace();
        } catch (IllegalStateException e) {
            e.printStackTrace();
        } catch (WindowManager.BadTokenException e) {
            e.printStackTrace();
        }
        /*   Happens when the library tries to open a dialog,
             but the activity is already closed, so generates a NullPointerException, IllegalStateException or BadTokenException.
			 In this way, a force close is avoided.*/
    }

    private static void userHasTappedToNotShowNoticeAgain(Context mContext, String mVersionDownloadable) {
        SharedPreferences prefs = mContext.getSharedPreferences(Dialog.PREFS_FILENAME, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(Dialog.DONT_SHOW_AGAIN_PREF_KEY + mVersionDownloadable, true);
        editor.commit();
    }

    private static void goToMarket(Context mContext) {
        mContext.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(Dialog.ROOT_PLAY_STORE_DEVICE + mContext.getPackageName())));

    }
}
