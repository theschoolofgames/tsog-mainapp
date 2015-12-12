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

import com.h102.SpeechRecognizer;
import com.h102.Wrapper;
import com.segment.analytics.Analytics;

public class AppActivity extends Cocos2dxActivity {

    private static final String TAG = AppActivity.class.getSimpleName();

    private static AppActivity app = null;

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        app = this;
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        Analytics.with(app).onIntegrationReady(Analytics.BundledIntegration.COUNTLY, new Analytics.Callback() {
            @Override
            public void onReady(Object instance) {
                Analytics.with(app).flush();
            }
        });

        Wrapper.activity = this;
        SpeechRecognizer.setupInstance(this);

        return glSurfaceView;
    }


//    public static boolean openScheme(String bundleId, String data) {
//        PackageManager manager = app.getPackageManager();
//
//        Intent i = manager.getLaunchIntentForPackage(bundleId);
//        if (i == null) {
//            AppActivity.showMessage("Error", "Target game not found");
//            return false;
//            //throw new PackageManager.NameNotFoundException();
//        }
//        i.setAction(Intent.ACTION_SEND);
//        i.putExtra(Intent.EXTRA_TEXT, data);
//        i.setType("text/plain");
//        i.addCategory(Intent.CATEGORY_LAUNCHER);
//        app.startActivity(i);
//        return true;
//    }
}