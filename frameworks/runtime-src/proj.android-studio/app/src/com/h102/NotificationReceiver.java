package com.h102;

/**
 * Created by tony on 3/13/17.
 */

import android.content.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

// NotificationReceiver is used to handle delete intents from notifications. When a user
// clears all notifications or swipes a bugle notification away, the intent we pass in as
// the delete intent will get handled here.
public class NotificationReceiver extends BroadcastReceiver {
    // Logging
    public static String ID_KEY = "";
    public static String TITLE_KEY = "";
    public static String SOUND_FILENAME_KEY = "";
    @Override
    public void onReceive(final Context context, final Intent intent) {

    }

}