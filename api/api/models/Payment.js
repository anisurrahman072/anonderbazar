/**
 * Payment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        user_id: {
            model: 'user',
            required: true
        },
        order_id: {
            model: 'order',
            required: true
        },
        suborder_id: {
            model: 'suborder',
            required: true
        },
        receiver_id: {
            model: 'user',
        },
        transection_key: {
            type: 'string',
        },
        details: {
            type: 'string',
        },
        payment_type: {
            type: 'string',
            required: true
        },
        payment_amount: {
            type: 'float',
            required: true
        },
        payment_date: {
            type: 'datetime'
        },
        status: {
            type: 'integer',
            required: true
        },
        createdAt: {
            type: 'datetime',
            columnName: 'created_at',
            defaultsTo: function () {
                return new Date();
            }
        },
        updatedAt: {
            type: 'datetime',
            columnName: 'updated_at',
            defaultsTo: function () {
                return new Date();
            }
        },
        deletedAt: {
            type: 'datetime',
            columnName: 'deleted_at',
            defaultsTo: null
        }
    },
    tableName: "payments",
    autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,

    // generating transection key before creating a row
    beforeCreate: function (req, next) {

        let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        let string_length = 16;
        let randomstring = '';
        for (let i=0; i<string_length; i++) {
            let rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        req.transection_key = randomstring;

        next();
    },
};

