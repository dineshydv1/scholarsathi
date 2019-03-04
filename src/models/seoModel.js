module.exports = (sequelize, Sequelize) => {
    const seoSchema = sequelize.define('Seo', {
        path: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: {
                msg: 'Path already exists'
            }
        },
        title: {
            type: Sequelize.STRING,
            allowNull: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        keywords: {
            type: Sequelize.STRING,
            allowNull: true
        }
    },{
        timestamps: false
    });
    return seoSchema;
}
