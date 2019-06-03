#!/bin/sh
#
# Copyright 2017-2019 Kopano and its licensors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -euo pipefail

# Check for parameters, prepend with our exe when the first arg is a parameter.
if [ "${1:0:1}" = '-' ]; then
	set -- ${EXE} "$@"
else
	# Check for some basic commands, this is used to allow easy calling without
	# having to prepend the binary all the time.
	case "${1}" in
		help|serve|version)
			set -- ${EXE} "$@"
			;;
	esac
fi

# Setup environment.
setup_env() {
	[ -f /etc/defaults/docker-env ] && source /etc/defaults/docker-env
}
setup_env

# Support additional args provided via environment.
if [ -n "${ARGS}" ]; then
	set -- "$@" ${ARGS}
fi


source /etc/kopano/konnectd.cfg
if [ -z "$oidc_issuer_identifier" ]; then
	echo "Entrypoint: WARN no issuer identifier set, using localhost!"
	oidc_issuer_identifier="https://localhost"
fi
echo "Entrypoint: Issuer url (--iss): $oidc_issuer_identifier"

if [ "$allow_dynamic_client_registration" = "yes" ]; then
	echo "Entrypoint: adding --allow-dynamic-client-registration"
	set -- "$@" --allow-dynamic-client-registration
fi


set -- "$@" --iss="$oidc_issuer_identifier"

# Run the service, optionally switching user when running as root.
if [ $(id -u) = 0 -a -n "${KONNECTD_USER}" ]; then
	userAndgroup="${KONNECTD_USER}"
	if [ -n "${KONNECTD_GROUP}" ]; then
		userAndgroup="${userAndgroup}:${KONNECTD_GROUP}"
	fi
	exec su-exec ${userAndgroup} "$@"
else
	exec "$@"
fi
