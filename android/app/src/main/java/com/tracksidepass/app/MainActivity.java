package com.tracksidepass.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VideoCardPlugin.class);   // the Race Log video card (Media3), registered before the bridge starts
        super.onCreate(savedInstanceState);
    }
}
