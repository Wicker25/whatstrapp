#!/usr/bin/env bash

KIBANA_DOMAIN='http://127.0.0.1:5601'
KIBANA_SETTINGS_FILEPATH='settings/kibana-settings.json'

function wait_for_connection {
    until $(curl -s -o /dev/null --head --fail "$1"); do
        sleep 1
    done
    echo -e "\e[32mdone\033[0m"
}

echo '====='
docker-compose up -d
echo '====='

echo -n "Waiting for Elasticsearch ... "
wait_for_connection 'http://127.0.0.1:9200/'

echo -n "Waiting for Kibana ... "
wait_for_connection 'http://127.0.0.1:5601/'

echo -n "Loading Kibana's settings ... "
curl \
  -s -o /dev/null \
  -X POST \
  -H 'Content-type:application/json'\
  -H 'kbn-xsrf: WhatsTrapp' \
  -d "@${KIBANA_SETTINGS_FILEPATH}" \
  "${KIBANA_DOMAIN}/api/saved_objects/_bulk_create"

if [ -n $? ]; then
  echo -e "\e[32mdone\033[0m"
else
  echo -e "\e[033mfailed\033[0m"
fi

echo '====='
echo 'Waiting for connection at http://127.0.0.1:8025/ ...';


