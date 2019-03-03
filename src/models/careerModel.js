module.exports = (sequelize, Sequelize) => {
    const CareerSchema = sequelize.define('Career', {
        full_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        date_of_birth: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        qualification: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        mobile: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        area_of_interest: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        join: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        resume_one_linear: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        doc: {
            type: Sequelize.STRING,
            allowNull: true,
        }
    });
    return CareerSchema;
}
