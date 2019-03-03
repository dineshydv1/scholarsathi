const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
    const OtpSchema = sequelize.define('Otp', {
        otp: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: true
        },
        ip: {
            type: Sequelize.STRING,
            allowNull: true
        },
        is_verified: {
            type: Sequelize.ENUM,
            values: ['y', 'n', 'd'],
            defaultValue: 'n',
            comment: 'n = not verified, y = verified, d = deleted'
        },
        type: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
            updatedAt: false
        });

    // verify otp
    OtpSchema.verifyOtp = function (whereCondition) {
        let Otp = this;
        whereCondition.is_verified = 'n';
        return Otp.findOne({
            where: whereCondition,
            order: [['created_at', 'DESC']]
        }).then((result) => {
            if (result) {
                result.is_verified = 'y';
                return result.save();
            }
            return Promise.reject({ message: 'Invalid Otp' });
        });
    }

    // is able to get otp

    OtpSchema.isAbleToGetOtp = function (whereCondition) {
        let Otp = this;
        whereCondition.created_at = {
            [sequelize.Op.between]: [moment().startOf('day').format(), moment().endOf('day').format()]
        }
        return Otp.count({where: whereCondition});
    }

    return OtpSchema;
}
