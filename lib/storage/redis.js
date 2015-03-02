'use strict';

var redis = require('redis');

/**
 * Sample storage engine for Grille CMS
 */
var RedisGrilleStorage = function(config) {
    if (!config) {
        config = {};
    }

    this.host = config.host || '127.0.0.1';
    this.port = config.port || 6379;

    this.keys = {};
    this.keys.current = config.current || 'grille-current';
    this.keys.collection = config.collection || 'grille-content';

    this.redis = redis.createClient(this.port, this.host, {});
};

/**
 * Saves this version of CMS data
 */
RedisGrilleStorage.prototype.save = function(version, data, callback) {
    data = JSON.stringify(data);

    this.redis.hset(this.keys.collection, version, data, function(err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};

/**
 * Sets the current version number
 */
RedisGrilleStorage.prototype.setCurrentVersion = function(version, callback) {
    this.redis.set(this.keys.current, version, function(err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
};

/**
 * Returns the current version number
 */
RedisGrilleStorage.prototype.getCurrentVersion = function(callback) {
    this.redis.get(this.keys.current, function(err, version) {
        if (err) {
            return callback(err);
        }

        callback(null, version);
    })
};

/**
 * Loads CMS data using the specified version number
 */
RedisGrilleStorage.prototype.load = function(version, callback) {
    this.redis.hget(this.keys.collection, version, function(err, data) {
        if (err) {
            return callback(err);
        }

        data = JSON.parse(data);

        callback(null, data);
    });
};

/**
 * Loads the current version of CMS data
 * load(getCurrentVersion())
 */
RedisGrilleStorage.prototype.loadCurrentVersion = function(callback) {
    var self = this;

    this.getCurrentVersion(function(err, version) {
        if (err) {
            return callback(err);
        }

        self.load(version, function(err, data) {
            if (err) {
                return callback(err);
            }

            callback(null, data);
        });
    });
};

/**
 * Gets a list of CMS versions (not guaranteed to be in order
 */
RedisGrilleStorage.prototype.list = function(callback) {
    this.redis.hkeys(this.keys.collection, function(err, versions) {
        if (err) {
            return callback(err);
        }

        callback(null, versions);
    });
};

module.exports = RedisGrilleStorage;