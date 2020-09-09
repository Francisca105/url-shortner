const { DataTypes, Model } = require('sequelize');

module.exports = class Tabela extends Model {
    static init(sequelize) {
        return super.init({
            link: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            redirect: { type: DataTypes.STRING},
            clicks: { type: DataTypes.STRING}
        }, {
            tableName: 'Tabela',
            timestamps: true,
            sequelize
        });
    }
}