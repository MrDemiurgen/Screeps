// Отладочная информация
const DEBUG_SPAWN = true;

const spawnManager = {
  run: function () {
    // Получаем первый спавн в игре (можно улучшить, если будет несколько спавнов)
    const spawn = Object.values(Game.spawns)[0];
    if (!spawn) {
      return; // Нет спавна, выходим
    }

    // Подсчёт крипов каждой роли
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');

    // Определение желаемого количества крипов по ролям
    const desiredCounts = { harvester: 2, upgrader: 1, builder: 1 };

    // Подсчёт строительных площадок
    const siteCount = spawn.room.find(FIND_CONSTRUCTION_SITES).length;

    // Подсчёт структур, что нужно починить
    const repairCount = spawn.room.find(FIND_STRUCTURES).filter((s) => s.hits < s.hitsMax).length;

    // Подсчёт структур, что нуждаются в энергии
    const energyCount = spawn.room
      .find(FIND_STRUCTURES)
      .filter(
        (s) =>
          (s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_EXTENSION ||
            s.structureType === STRUCTURE_TOWER) &&
          s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      ).length;

    // Если нет структур для постройки или починки, уменьшаем количество строителей
    if (siteCount === 0 && repairCount === 0) {
      desiredCounts.builder = 0;
    }

    // Если нет структур без энергии или EXTENSION И TOWER, уменьшаем количество харвестеров
    if (
      energyCount === 0 ||
      spawn.room
        .find(FIND_STRUCTURES)
        .filter(
          (s) => s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER,
        ).length === 0
    ) {
      desiredCounts.harvester = 1;
    }

    // Уничтожаем крипов, если их больше, чем нужно
    if (harvesters.length > desiredCounts.harvester) {
      const extra = harvesters.reduce((min, creep) =>
        creep.ticksToLive < min.ticksToLive ? creep : min,
      );
      extra.suicide();
    }
    if (upgraders.length > desiredCounts.upgrader) {
      const extra = upgraders.reduce((min, creep) =>
        creep.ticksToLive < min.ticksToLive ? creep : min,
      );
      extra.suicide();
    }
    if (builders.length > desiredCounts.builder) {
      const extra = builders.reduce((min, creep) =>
        creep.ticksToLive < min.ticksToLive ? creep : min,
      );
      extra.suicide();
    }

    // Проверка занят ли сейчас спавн
    if (!spawn.spawning) {
      // Спавн крипов с ролью Harvester
      if (harvesters.length < desiredCounts.harvester) {
        const newName = 'Harvester' + Game.time;
        const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: { role: 'harvester' },
        });
        if (DEBUG_SPAWN && result === OK) {
          console.log('Spawning new harvester: ' + newName);
        }
      }
      // Спавн крипов с ролью Upgrader
      else if (upgraders.length < desiredCounts.upgrader) {
        const newName = 'Upgrader' + Game.time;
        const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: { role: 'upgrader' },
        });
        if (DEBUG_SPAWN && result === OK) {
          console.log('Spawning new upgrader: ' + newName);
        }
      }

      // Спавн крипов с ролью Builder
      else if (builders.length < desiredCounts.builder) {
        const newName = 'Builder' + Game.time;
        const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
          memory: { role: 'builder' },
        });
        if (DEBUG_SPAWN && result === OK) {
          console.log('Spawning new builder: ' + newName);
        }
      }
    }

    // Визуализация процесса спавна на экране
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text('🛠️' + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
        align: 'left',
        opacity: 0.8,
      });
    }
  },
};

module.exports = spawnManager;
