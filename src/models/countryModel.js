module.exports = (sequelize, Sequelize) => {
    const CountrySchema = sequelize.define('Country', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        time: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    }, {
            timestamps: false
        });
    return CountrySchema;
}
