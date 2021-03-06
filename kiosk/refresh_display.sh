#!/bin/bash

#this is idempotent, so run any number of times

echo "=== killing chromium browser"

killall chromium-browser
killall python

cd ~/github/distributed-gardens/viz/build
python -m SimpleHTTPServer&
DISPLAY=:0 chromium-browser --noerrdialogs --incognito --kiosk --use-fake-ui-for-media-stream --test-type http://localhost:8000/index.html

export DISPLAY=:0
xset s noblank
xset s reset
