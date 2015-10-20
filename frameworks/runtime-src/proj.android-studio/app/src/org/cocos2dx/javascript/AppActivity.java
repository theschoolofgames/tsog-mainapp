/****************************************************************************
Copyright (c) 2015 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.Map;
import java.util.HashMap;

import com.segment.analytics.Analytics;
import com.segment.analytics.Traits;
import com.segment.analytics.Properties;
import com.segment.analytics.ValueMap;

public class AppActivity extends Cocos2dxActivity {
    
    private static AppActivity app = null;
    private static String udid;

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        app = this;
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        udid = android.provider.Settings.System.getString(super.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
        Analytics.with(app);

        return glSurfaceView;
    }

    // Reflection
    public static void showMessage(String title, String message) {
        final String aTitle = title, aMessage = message;
        app.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AlertDialog alertDialog = new AlertDialog.Builder(app).create();
                alertDialog.setTitle(aTitle);
                alertDialog.setMessage(aMessage);
                alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                    new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
                alertDialog.show();
            }
        });
    }

    public static boolean openScheme(String bundleId, String data) {
        PackageManager manager = app.getPackageManager();

        Intent i = manager.getLaunchIntentForPackage(bundleId);
        if (i == null) {
            AppActivity.showMessage("Error", "Target game not found");
            return false;
            //throw new PackageManager.NameNotFoundException();
        }
        i.setAction(Intent.ACTION_SEND);
        i.putExtra(Intent.EXTRA_TEXT, data);
        i.setType("text/plain");
        i.addCategory(Intent.CATEGORY_LAUNCHER);
        app.startActivity(i);
        return true;    
    }

    public static String getId() {
        return udid;
    }

    public static void segmentIdentity(String userId, String traits) {
        Map<String, Object> retMap = new Gson().fromJson(traits, new TypeToken<HashMap<String, Object>>() {}.getType());

        Traits t = new Traits();
        for(Map.Entry<String, Object> entry : retMap.entrySet()) {
            t.putValue(entry.getKey(), entry.getValue());
        }

        Analytics.with(app).identify(userId, t, null);
    }

    public static void segmentTrack(String event, String properties) {
        Map<String, Object> retMap = new Gson().fromJson(properties, new TypeToken<HashMap<String, Object>>() {}.getType());

        Properties p = new Properties();
        for(Map.Entry<String, Object> entry : retMap.entrySet()) {
            p.putValue(entry.getKey(), entry.getValue());
        }
        Analytics.with(app).track(event, p);
    }
}