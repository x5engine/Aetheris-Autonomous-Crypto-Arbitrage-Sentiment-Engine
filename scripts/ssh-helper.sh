#!/bin/bash

# SSH Helper - Detects SSH method (keys or password)
# Usage: source this file, then use $SSH_CMD variable

detect_ssh_method() {
    local user=$1
    local ip=$2
    local password=$3
    
    # Try SSH with keys first (BatchMode=yes prevents password prompt)
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$user@$ip" "echo 'test'" 2>/dev/null; then
        echo "keys"
        return 0
    fi
    
    # If keys don't work, check if sshpass is available
    if command -v sshpass &> /dev/null; then
        # Test with password
        if sshpass -p "$password" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$user@$ip" "echo 'test'" 2>/dev/null; then
            echo "password"
            return 0
        fi
    fi
    
    echo "none"
    return 1
}

get_ssh_cmd() {
    local method=$1
    local user=$2
    local ip=$3
    local password=$4
    
    if [ "$method" = "keys" ]; then
        echo "ssh -o StrictHostKeyChecking=no"
    elif [ "$method" = "password" ]; then
        echo "sshpass -p \"$password\" ssh -o StrictHostKeyChecking=no"
    else
        return 1
    fi
}

