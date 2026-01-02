const roleBuilder = {
  /** @param {Creep} creep */
  run(creep) {
    const pickTarget = () => {
      const repairTargets = creep.room.find(FIND_STRUCTURES).filter((s) => s.hits < s.hitsMax);
      if (repairTargets.length > 0) {
        return { state: 'repairing', id: repairTargets[0].id };
      }

      const buildTargets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (buildTargets.length > 0) {
        return { state: 'building', id: buildTargets[0].id };
      }

      return null;
    };

    // Если в памяти ещё нет состояния — задаём начальное
    if (!creep.memory.state) {
      creep.memory.state = 'harvesting';
    }

    // Читаем текущее состояние в локальную переменную
    let state = creep.memory.state;

    // --- Переключение состояний ---

    // Если энергии нет — идем добывать
    if (creep.store.getUsedCapacity() === 0) {
      state = 'harvesting';
      creep.memory.targetId = null;
    }

    // Добыли энергию — выбираем задачу по приоритету
    if (state === 'harvesting' && creep.store.getFreeCapacity() === 0) {
      const next = pickTarget();
      if (next) {
        state = next.state;
        creep.memory.targetId = next.id;
      }
    }

    // Если мы в ремонте — остаемся, пока цель не починена
    if (state === 'repairing') {
      const target = Game.getObjectById(creep.memory.targetId);

      if (!target || target.hits === target.hitsMax) {
        creep.memory.targetId = null;

        // Нет цели — выбираем следующую по приоритету
        const next = pickTarget();
        if (next) {
          state = next.state;
          creep.memory.targetId = next.id;
        }
      }
    }

    // Если мы строим — остаемся, пока стройка не завершится
    if (state === 'building') {
      const target = Game.getObjectById(creep.memory.targetId);

      if (!target) {
        creep.memory.targetId = null;

        // Нет цели — выбираем следующую по приоритету
        const next = pickTarget();
        if (next) {
          state = next.state;
          creep.memory.targetId = next.id;
        }
      }
    }

    // --- Поведение в каждом состоянии ---

    // 1. Состояние "добыча энергии"
    if (state === 'harvesting') {
      const sources = creep.room.find(FIND_SOURCES);

      // Если есть хотя бы один источник → идём добывать с него энергию
      if (sources.length > 0) {
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], {
            visualizePathStyle: { stroke: '#ffaa00' },
          });
        }
      }
    }

    // 2. Состояние "строительство"
    else if (state === 'repairing') {
      const target = Game.getObjectById(creep.memory.targetId);
      if (target) {
        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: '#ffffff' },
          });
        }
      }
    }

    // 3. Состояние "строительство"
    else if (state === 'building') {
      const target = Game.getObjectById(creep.memory.targetId);
      if (target) {
        if (creep.build(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {
            visualizePathStyle: { stroke: '#ffffff' },
          });
        }
      }
    }

    // Сохраняем обновлённое состояние в память крипа
    creep.memory.state = state;
  },
};

module.exports = roleBuilder;
