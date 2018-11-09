#!/usr/bin/env bash
docker push "${IMAGE_NAME}:${VERSION}"
docker push "${IMAGE_NAME}:latest"
