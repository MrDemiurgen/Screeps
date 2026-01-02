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
        // Подсчёт строительных площадок
        const siteCount = spawn.room.find(FIND_CONSTRUCTION_SITES).length;
        // Спавним билдера только если есть строительные площадки
        if (siteCount > 0) {
          const newName = 'Builder' + Game.time;
          const result = spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
            memory: { role: 'builder' },
          });
          if (DEBUG_SPAWN && result === OK) {
            console.log('Spawning new builder: ' + newName);
          }
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
