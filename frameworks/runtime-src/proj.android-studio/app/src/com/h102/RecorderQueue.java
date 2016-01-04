package com.h102;

import android.util.Base64;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by nick on 1/4/16.
 */
public class RecorderQueue extends ArrayList<Map<String, Object>> {
    private int maxCapacity = -1,
            currentCapacity = 0;

    public Map<String, Object> dequeue() {
        Map<String, Object> dict = null;

        if (this.size() > 0) {
            dict = this.get(0);

            this.remove(0);
            this.currentCapacity -= (int)dict.get("length");
        }

        return dict;
    }

    public void enqueue(byte[] buffer, int maxPeak, int length) {
        this.currentCapacity += length;

        Map<String, Object> obj = new HashMap<>();
        obj.put("data", Base64.encodeToString(buffer, Base64.DEFAULT));
        obj.put("length", length);
        obj.put("maxPeak", maxPeak);

        this.add(obj);

        if (this.maxCapacity > 0 && this.currentCapacity > this.maxCapacity)
            while (this.currentCapacity > this.maxCapacity)
                this.dequeue();
    }

    public int getMaxPeak() {
        int maxPeak = 0;

        for (int i = 0; i < this.size(); i++) {
            Map<String, Object> dict = this.get(i);

            int peak = (int)dict.get("maxPeak");
            if (peak > maxPeak)
                maxPeak = peak;
        }

        return maxPeak;
    }

    public void setMaxCapacity(int capacity) {
        maxCapacity = capacity;
    }
}
