#!/bin/bash
set -e

echo "--- Imarah Production Startup ---"

# Create .env from environment variables if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env from environment..."
    cp .env.example .env
fi

# Set APP_KEY if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run database migrations
echo "Running migrations..."
php artisan migrate --force

# Clear and rebuild cache
echo "Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "--- Starting services ---"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
