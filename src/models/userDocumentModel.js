module.exports = (sequelize, Sequelize) => {
    const UserDocumentSchema = sequelize.define('UserDocument', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        doc: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });

    return UserDocumentSchema;
}
