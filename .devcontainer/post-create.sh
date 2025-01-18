#!/bin/bash

# Add source command to main bashrc
echo '
# Source custom settings
# Source custom bashrc settings if the file exists
if [ -f /pyspur/.devcontainer/.bashrc ]; then
    source /pyspur/.devcontainer/.bashrc
fi' >> ~/.bashrc 