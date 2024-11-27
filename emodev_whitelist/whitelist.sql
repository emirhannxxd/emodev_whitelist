CREATE TABLE `emodev_whitelist` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`discord_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
	`steam_hex` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
	`ekleyen` VARCHAR(30) NOT NULL COLLATE 'utf8mb3_general_ci',
	`eklemetarih` TIMESTAMP NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `steam_hex` (`steam_hex`) USING BTREE
)
COLLATE='utf8mb3_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=15;