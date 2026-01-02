// Импорт менеджера спавна
/** @type {import('./spawnManager')} */
const spawnManager = require('spawnManager');

// Импорт логики роли харвестера
/** @type {import('./role.harvester')} */
const roleHarvester = require('role.harvester');

// Импорт логики роли билдера
/** @type {import('./role.builder')} */
const roleBuilder = require('role.builder');

// Импорт логики роли апгрейдера
/** @type {import('./role.upgrader')} */
const roleUpgrader = require('role.upgrader');

// Главный игровой цикл, вызывается Screeps каждый тик
module.exports.loop = function () {
  // Очистка памяти от крипов, которых уже нет в игре
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  spawnManager.run();

  // Перебор всех живых крипов и запуск поведения в зависимости от роли
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];

    switch (creep.memory.role) {
      case 'harvester':
        // Запуск логики роли харвестера
        roleHarvester.run(creep);
        break;

      case 'builder':
        // Запуск логики роли билдера
        roleBuilder.run(creep);
        break;

      case 'upgrader':
        // Запуск логики роли апгрейдера
        roleUpgrader.run(creep);
        break;
    }
  }
};
