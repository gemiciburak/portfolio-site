#!/bin/sh
# İlk sertifikayı alır. Yalnızca BİR KEZ çalıştırılır; yenilemeyi certbot
# konteyneri kendisi üstlenir.
#
# Kullanım:
#   EMAIL="siz@ornek.com" ./nginx/init-letsencrypt.sh
#
# Ön koşul: DOMAIN kayıtları bu sunucunun IP'sine bakıyor olmalı.

set -eu

DOMAIN="${DOMAIN:-www.burakgemici.com.tr}"
ALT_DOMAIN="${ALT_DOMAIN:-burakgemici.com.tr}"
COMPOSE="docker compose -f docker-compose.prod.yml"

if [ -z "${EMAIL:-}" ]; then
  echo "HATA: EMAIL tanımlı değil.  EMAIL=\"siz@ornek.com\" $0" >&2
  exit 1
fi

echo "→ Sertifika alınıyor: $DOMAIN, $ALT_DOMAIN"

# Nginx HTTPS bloklarındaki sertifika dosyaları henüz yokken açılamaz;
# bu yüzden doğrulama standalone certbot ile 80 portundan yapılır.
$COMPOSE run --rm --service-ports --entrypoint "\
  certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos --no-eff-email \
    -d $DOMAIN -d $ALT_DOMAIN" certbot

echo "✓ Sertifika alındı. Şimdi:  $COMPOSE up -d"
