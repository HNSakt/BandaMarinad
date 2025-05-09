/datum/tech/repeatable/ob
	name = "OB Ammo"
	desc = "Purchase orbital bombardment ammo."

	required_points = 5
	increase_per_purchase = 2

	tier = /datum/tier/two

	var/type_to_give

/datum/tech/repeatable/ob/on_unlock()
	. = ..()
	if(!type_to_give)
		return

	var/datum/supply_order/O = new /datum/supply_order()
	O.ordernum = GLOB.supply_controller.ordernum++
	var/actual_type = GLOB.supply_packs_types[type_to_give]
	O.objects = list(GLOB.supply_packs_datums[actual_type])
	O.orderedby = MAIN_AI_SYSTEM

	GLOB.supply_controller.shoppinglist += O

/datum/tech/repeatable/ob/he
	name = "Additional OB projectiles - HE"
	desc = "Highly explosive bombardment ammo, to be loaded into the orbital cannon."
	icon_state = "ob_he"

	announce_message = "В Requisitions' ASRS были доставлены дополнительные боеголовки для орбитальных бомбардировок с взрывчатым веществом."

	flags = TREE_FLAG_MARINE

	type_to_give = "OB HE Crate"

/datum/tech/repeatable/ob/cluster
	name = "Additional OB projectiles - Cluster"
	desc = "Highly explosive bombardment ammo that fragments, to be loaded into the orbital cannon."
	icon_state = "ob_cluster"

	announce_message = "В Requisitions' ASRS были доставлены дополнительные боеголовки для орбитальных бомбардировок с кассетной боевой частью."

	flags = TREE_FLAG_MARINE

	type_to_give = "OB Cluster Crate"

/datum/tech/repeatable/ob/incend
	name = "Additional OB projectiles - Incendiary"
	desc = "Highly flammable bombardment ammo, to be loaded into the orbital cannon."
	icon_state = "ob_incend"

	announce_message = "В Requisitions' ASRS были доставлены дополнительные боеголовки для орбитальных бомбардировок с зажигательной боевой частью."

	flags = TREE_FLAG_MARINE

	type_to_give = "OB Incendiary Crate"
