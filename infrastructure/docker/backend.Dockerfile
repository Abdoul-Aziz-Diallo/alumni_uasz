FROM php:8.3-cli-alpine

RUN docker-php-ext-install pdo_mysql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# Le code Laravel sera ajouté dans backend/ après disponibilité de Composer.
COPY backend/ ./
EXPOSE 8000
CMD ["sh", "-lc", "composer install && php artisan serve --host=0.0.0.0 --port=8000"]
