#!/bin/bash

USER=muratayusuke
HOST=jenkins.muratayusuke.com
TARGET_DIR=/usr/local/apache/vhosts/kumonos.jp/htdocs/facebook_search/test

scp channel.php ${USER}@${HOST}:${TARGET_DIR}
scp index.html ${USER}@${HOST}:${TARGET_DIR}
scp jquery.min.js ${USER}@${HOST}:${TARGET_DIR}
scp main.css ${USER}@${HOST}:${TARGET_DIR}
scp main.js ${USER}@${HOST}:${TARGET_DIR}
