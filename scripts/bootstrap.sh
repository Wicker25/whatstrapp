#!/usr/bin/env bash -eo pipefail

KIBANA_SETTINGS_FILEPATH='settings/kibana-settings.json'

function wait_for_it {
    until $(curl -s -o /dev/null --head --fail "$1"); do
        sleep 1
    done
    echo -e "\e[32mdone\033[0m"
}

echo -n "Waiting for Elasticsearch ... "
wait_for_it $ELASTICSEARCH_URL

echo -n "Waiting for Kibana ... "
wait_for_it $KIBANA_URL

echo -n "Loading Kibana's settings ... "
curl \
  -s -o /dev/null \
  -X POST \
  -H 'Content-type:application/json'\
  -H 'kbn-xsrf: WhatsTrapp' \
  -d "@${KIBANA_SETTINGS_FILEPATH}" \
  "${KIBANA_URL}/api/saved_objects/_bulk_create"

if [ -n $? ]; then
  echo -e "\e[32mdone\033[0m"
else
  echo -e "\e[033mfailed\033[0m"
fi

