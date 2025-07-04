/datum/hive_status_ui
	var/name = "Hive Status"

	// Data to pass when rendering the UI (not static)
	var/total_xenos
	var/list/xeno_icons
	var/list/xeno_counts
	var/list/tier_slots
	var/list/xeno_vitals
	var/list/xeno_keys
	var/list/xeno_info
	var/hive_location
	var/burrowed_larva
	var/evilution_level
	var/pylon_status
	var/xeno_background

	var/data_initialized = FALSE

	var/datum/hive_status/assoc_hive = null

/datum/hive_status_ui/New(datum/hive_status/hive)
	assoc_hive = hive
	update_all_data()
	START_PROCESSING(SShive_status, src)

/datum/hive_status_ui/process()
	update_xeno_vitals()
	update_xeno_info(FALSE)
	SStgui.update_uis(src)

// Updates the list tracking how many xenos there are in each tier, and how many there are in total
/datum/hive_status_ui/proc/update_xeno_counts(send_update = TRUE)
	xeno_counts = assoc_hive.get_xeno_counts()

	total_xenos = 0
	for(var/counts in xeno_counts)
		for(var/caste in counts)
			total_xenos += counts[caste]

	if(send_update)
		SStgui.update_uis(src)

	xeno_counts[1] -= "Queen" // don't show queen in the amount of xenos

	// Also update the amount of T2/T3 slots
	tier_slots = assoc_hive.get_tier_slots()

// Updates the hive location using the area name of the defined hive location turf
/datum/hive_status_ui/proc/update_hive_location(send_update = TRUE)
	if(!assoc_hive.hive_location)
		return

	hive_location = strip_improper(get_area_name(assoc_hive.hive_location))

	if(send_update)
		SStgui.update_uis(src)

// Updates the sorted list of all xenos that we use as a key for all other information
/datum/hive_status_ui/proc/update_xeno_keys(send_update = TRUE)
	xeno_keys = assoc_hive.get_xeno_keys()

	if(send_update)
		SStgui.update_uis(src)

// Mildly related to the above, but only for when xenos are removed from the hive
// If a xeno dies, we don't have to regenerate all xeno info and sort it again, just remove them from the data list
/datum/hive_status_ui/proc/xeno_removed(mob/living/carbon/xenomorph/X)
	if(!xeno_keys)
		return

	for(var/index in 1 to length(xeno_keys))
		var/list/info = xeno_keys[index]
		if(info["nicknumber"] == X.nicknumber)

			// tried Remove(), didn't work. *shrug*
			xeno_keys[index] = null
			xeno_keys -= null
			return

	SStgui.update_uis(src)

// Updates the list of xeno names, strains and references
/datum/hive_status_ui/proc/update_xeno_info(send_update = TRUE)
	xeno_info = assoc_hive.get_xeno_info()

	if(send_update)
		SStgui.update_uis(src)

// Updates vital information about xenos such as health and location. Only info that should be updated regularly
/datum/hive_status_ui/proc/update_xeno_vitals()
	xeno_vitals = assoc_hive.get_xeno_vitals()

// Updates how many buried larva there are
/datum/hive_status_ui/proc/update_burrowed_larva(send_update = TRUE)
	burrowed_larva = assoc_hive.stored_larva
	if(SSxevolution)
		evilution_level = SSxevolution.get_evolution_boost_power(assoc_hive.hivenumber)
	else
		evilution_level = 1
	if(send_update)
		SStgui.update_uis(src)

/datum/hive_status_ui/proc/update_xeno_icons(send_update = TRUE)
	xeno_icons = assoc_hive.get_xeno_icons()
	xeno_background = assoc_hive.get_xeno_background()

	if(send_update)
		SStgui.update_uis(src)

// Updates all data except burrowed larva
/datum/hive_status_ui/proc/update_all_xeno_data(send_update = TRUE)
	update_xeno_counts(FALSE)
	update_xeno_vitals()
	update_xeno_keys(FALSE)
	update_xeno_info(FALSE)
	update_pylon_status(FALSE)
	update_xeno_icons(FALSE)

	if(send_update)
		SStgui.update_uis(src)

// Updates all data, including burrowed larva
/datum/hive_status_ui/proc/update_all_data()
	data_initialized = TRUE
	update_all_xeno_data(FALSE)
	update_burrowed_larva(FALSE)
	update_pylon_status(FALSE)
	SStgui.update_uis(src)

/datum/hive_status_ui/proc/update_pylon_status(send_update = TRUE)
	if(assoc_hive.get_structure_count(XENO_STRUCTURE_PYLON) < 1)
		pylon_status = ""
	else if(assoc_hive.buff_points >= assoc_hive.max_buff_points)
		pylon_status = "Мы достигли лимита королевской смолы в [assoc_hive.max_buff_points] ед., используйте их!"
	else
		pylon_status = "Пилоны предоставляют нам королевскую смолу! Сейчас имеется: [assoc_hive.buff_points]."
	if(send_update)
		SStgui.update_uis(src)

/datum/hive_status_ui/ui_state(mob/user)
	return GLOB.hive_state[assoc_hive.internal_faction]

/datum/hive_status_ui/ui_status(mob/user, datum/ui_state/state)
	. = ..()
	if(isobserver(user))
		return UI_INTERACTIVE

	// If the Queen died or is otherwise missing.
	if(!assoc_hive.living_xeno_queen && !assoc_hive.allow_no_queen_actions)
		return UI_CLOSE

/datum/hive_status_ui/ui_data(mob/user)
	. = list()
	.["total_xenos"] = total_xenos
	.["xeno_icons"] = xeno_icons
	.["xeno_counts"] = xeno_counts
	.["tier_slots"] = tier_slots
	.["xeno_keys"] = xeno_keys
	.["xeno_info"] = xeno_info
	.["xeno_vitals"] = xeno_vitals
	.["queen_location"] = null
	if(assoc_hive.living_xeno_queen)
		.["queen_location"] = get_area_name(assoc_hive.living_xeno_queen)
	.["hive_location"] = hive_location
	.["burrowed_larva"] = burrowed_larva
	.["evilution_level"] = evilution_level
	.["pylon_status"] = pylon_status
	.["xeno_background"] = xeno_background

	var/mob/living/carbon/xenomorph/queen/Q = user
	.["is_in_ovi"] = istype(Q) && Q.ovipositor

/datum/hive_status_ui/ui_static_data(mob/user)
	. = list()
	.["user_ref"] = REF(user)
	.["hive_color"] = assoc_hive.ui_color
	.["hive_name"] = assoc_hive.name

/datum/hive_status_ui/proc/open_hive_status(mob/user)
	if(!user)
		return

	// Update absolutely all data
	if(!data_initialized)
		update_all_data()

	tgui_interact(user)

/datum/hive_status_ui/tgui_interact(mob/user, datum/tgui/ui)
	if(!assoc_hive)
		return

	ui = SStgui.try_update_ui(user, src, ui)
	if (!ui)
		ui = new(user, src, "HiveStatus", "[assoc_hive.name] Status")
		ui.open()
		ui.set_autoupdate(FALSE)

/datum/hive_status_ui/ui_act(action, list/params, datum/tgui/ui, datum/ui_state/state)
	. = ..()
	if(.)
		return

	switch(action)
		if("give_plasma")
			var/mob/living/carbon/xenomorph/xenoTarget = locate(params["target_ref"]) in GLOB.living_xeno_list
			var/mob/living/carbon/xenomorph/xenoSrc = ui.user

			if(QDELETED(xenoTarget) || xenoTarget.stat == DEAD || should_block_game_interaction(xenoTarget))
				return

			if(xenoSrc.stat == DEAD)
				return

			var/datum/action/xeno_action/A = get_action(xenoSrc, /datum/action/xeno_action/activable/queen_give_plasma)
			A?.use_ability_wrapper(xenoTarget)

		if("heal")
			var/mob/living/carbon/xenomorph/xenoTarget = locate(params["target_ref"]) in GLOB.living_xeno_list
			var/mob/living/carbon/xenomorph/xenoSrc = ui.user

			if(QDELETED(xenoTarget) || xenoTarget.stat == DEAD || should_block_game_interaction(xenoTarget))
				return

			if(xenoSrc.stat == DEAD)
				return

			var/datum/action/xeno_action/A = get_action(xenoSrc, /datum/action/xeno_action/activable/queen_heal)
			A?.use_ability_wrapper(xenoTarget, TRUE)

		if("overwatch")
			var/mob/living/carbon/xenomorph/xenoTarget = locate(params["target_ref"]) in GLOB.living_xeno_list
			var/mob/living/carbon/xenomorph/xenoSrc = ui.user

			if(QDELETED(xenoTarget) || xenoTarget.stat == DEAD || should_block_game_interaction(xenoTarget))
				return

			if(xenoSrc.stat == DEAD)
				if(isobserver(xenoSrc))
					var/mob/dead/observer/O = xenoSrc
					O.ManualFollow(xenoTarget)
				return

			if(!xenoSrc.check_state(TRUE))
				return

			xenoSrc.overwatch(xenoTarget)
