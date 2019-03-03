const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = 'scholarsathi';

module.exports = (sequelize, Sequelize) => {
    const AdminSchema = sequelize.define('Admin', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: {
                msg: 'Email already exists'
            },
            validate: {
                isEmail: {
                    msg: 'Please enter valid email address'
                }
            }
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: {
                msg: 'Mobile already exists'
            },
            validate: {
                is: {
                    args: /^[6-9]\d{9}$/,
                    msg: 'Please enter valid mobile'
                }
            }
        },
        password: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    args: true,
                    msg: 'Password field is required'
                },
                min: {
                    args: 4,
                    msg: 'Please enter password at least 4 character'
                }
            }
        },
        token: {
            type: Sequelize.STRING,
            allowNull: true
        },
        role_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        img: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM,
            values: ['y', 'n'],
            defaultValue: 'y'
        }
    }, {
            hooks: {
                beforeCreate: async (user) => {
                    // hash password
                    user.password = AdminSchema.genHashPassword(user.password);
                },
                afterCreate: async (user) => {
                    // generate token
                    user.token = AdminSchema.genToken(user.id);
                    await user.save();
                },
            },
            defaultScope: {
                attributes: { exclude: ['password'] }
            },
            scopes: {
                withPassword: {
                    attributes: {}
                }
            }
        });

    AdminSchema.genHashPassword = (password) => {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    AdminSchema.genToken = (id) => {
        return jwt.sign({ id }, secretKey);
    }

    AdminSchema.prototype.compare = function (body) {
        let user = this;
        let isTrue = bcrypt.compareSync(body.password, user.password);
        if (!isTrue) {
            return Promise.reject('Invalid credentials');
        }
        return user;
    }

    AdminSchema.login = function (body, db) {
        const Admin = this;
        return Admin.scope('withPassword').findOne(
            {
                where: { email: body.email },
                include: [{ model: db.AdminRole, as: 'admin_role', attributes: ['name'] }]
            },
        )
            .then((result) => {
                if (result) {
                    return result.compare(body);
                } else {
                    return Promise.reject('Invalid credentials');
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }

    return AdminSchema;
}
