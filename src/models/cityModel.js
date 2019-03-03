module.exports = (sequelize, Sequelize) => {
    const CitySchema = sequelize.define('City', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        state_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // references: {
            //     model: 'State',
            //     key: 'id'
            // }
        },
        country_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // references: {
            //     model: 'Country',
            //     key: 'id'
            // }
        },
    }, {
            timestamps: false
        });
    return CitySchema;
}
