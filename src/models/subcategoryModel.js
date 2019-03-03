module.exports = (sequelize, Sequelize) => {
    const SubcategorySchema = sequelize.define('Subcategory', {
        name: {
            type: Sequelize.STRING,
            trim: true,
            allowNull: false,
            defaultValue: '',
            validate: {
                notEmpty: { msg: 'Name is required' },
            }
        },
        category_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        img: {
            type: Sequelize.STRING,
            allowNull: true
        }
    },{
        timestamps: false
    });
    return SubcategorySchema;
}

// SubcategorySchema.sync()
//     .then(() => { }).catch(() => { });


