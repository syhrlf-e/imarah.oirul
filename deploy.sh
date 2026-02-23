#!/bin/bash
# Imarah Auto Deploy Script
cd /var/www/imarah

echo "$(date) - Deploy started" >> /var/www/deploy.log

git pull origin main 2>&1 >> /var/www/deploy.log
composer install --no-dev --optimize-autoloader 2>&1 >> /var/www/deploy.log
npm ci && npm run build 2>&1 >> /var/www/deploy.log
php artisan migrate --force 2>&1 >> /var/www/deploy.log
php artisan optimize 2>&1 >> /var/www/deploy.log
chown -R www-data:www-data storage bootstrap/cache

echo "$(date) - Deploy completed" >> /var/www/deploy.log
