module.exports = (sequelize, Sequelize) => {
    const SubjetSchema = sequelize.define('Subject', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        subcategories: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Subcategory is required' },
            }
        },
    }, {
            timestamps: false
        });
    return SubjetSchema;
}
