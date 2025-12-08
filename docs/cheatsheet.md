````js
//Спавн крипа через консоль (Спавн, Массив тел, Имя, {Память: Роль = 'Название'})
Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], 'Harvester1');
Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], 'Builder1', { memory: { role: 'builder' } });



//Присваеваем роль крипу по имени
Game.creeps['Builder1'].memory.role = 'builder';
Game.creeps['Harvester1'].memory.role = 'harvester';
Game.creeps['Upgrader1'].memory.role = 'upgrader';



//Самоуничтожить крипа по имени
Game.creeps['Harvester1'].suicide();



//Активация защитного режима для определенного Спавна
Game.spawns['Spawn1'].room.controller.activateSafeMode();



//Команда для спавна определенной постройки по указанным координатам
Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );



// Пример параметров визуализации пути
visualizePathStyle: {
  stroke: '#ffaa00',
  strokeWidth: 0.15,
  lineStyle: 'dashed',
  opacity: 0.5
}

```
Тип части		Стоимость энергии
MOVE			    50
WORK			    100
CARRY			    50
ATTACK			  80
RANGED_ATTACK	150
HEAL			    250
CLAIM			    600
TOUGH			    10
````
