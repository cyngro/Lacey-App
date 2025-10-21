#!/bin/bash

# Temporarily disable RVM
export GEM_PATH=""
export GEM_HOME=""
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Install CocoaPods using system Ruby
/opt/homebrew/Cellar/ruby/3.4.7/bin/gem install cocoapods

# Run pod install
cd ios
pod install
