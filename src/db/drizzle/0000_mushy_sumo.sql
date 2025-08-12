CREATE TABLE `hörspielBuchautor` (
	`hörspielID` integer NOT NULL,
	`personID` integer NOT NULL,
	PRIMARY KEY(`hörspielID`, `personID`),
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`personID`) REFERENCES `person`(`personID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `kapitel` (
	`abweichenderTitel` text,
	`hörspielID` integer NOT NULL,
	`position` integer NOT NULL,
	`trackID` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`trackID`) REFERENCES `track`(`trackID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `dieDr3i` (
	`hörspielID` integer PRIMARY KEY NOT NULL,
	`nummer` integer,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `episode_view` (
	`description` text,
	`episodeId` integer NOT NULL,
	`number` integer,
	`releaseDate` text,
	`title` text NOT NULL,
	`trackDuration` integer,
	`trackPosition` integer,
	`trackTitle` text,
	`trackPart` integer,
	`castPersonId` integer,
	`castName` text,
	`castPseudonym` text,
	`castRole` text,
	`bookAuthorId` integer,
	`bookAuthorName` text,
	`scriptAuthorId` integer,
	`scriptAuthorName` text,
	PRIMARY KEY(`episodeId`, `trackPosition`, `trackPart`, `castPersonId`, `bookAuthorId`, `scriptAuthorId`)
);
--> statement-breakpoint
CREATE TABLE `kids` (
	`hörspielID` integer PRIMARY KEY NOT NULL,
	`nummer` integer,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medium` (
	`hörspielID` integer NOT NULL,
	`mediumID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`musicBrainzID` text,
	`position` integer NOT NULL,
	`ripLog` integer NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hörspiel` (
	`cover` integer NOT NULL,
	`beschreibung` text,
	`hörspielID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idAmazon` text,
	`idAmazonMusic` text,
	`idAppleMusic` text,
	`idBookbeat` text,
	`idSpotify` text,
	`idYouTubeMusic` text,
	`unvollständig` integer NOT NULL,
	`metabeschreibung` text,
	`veröffentlichungsdatum` text,
	`kurzbeschreibung` text,
	`titel` text NOT NULL,
	`urlCoverApple` text,
	`urlCoverKosmos` text,
	`urlDreifragezeichen` text
);
--> statement-breakpoint
CREATE TABLE `sonstige` (
	`hörspielID` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hörspielTeil` (
	`hörspiel` integer NOT NULL,
	`buchstabe` text,
	`teil` integer PRIMARY KEY NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`hörspiel`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`teil`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hörspielTeil_hörspiel_position_unique` ON `hörspielTeil` (`hörspiel`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `hörspielTeil_hörspiel_buchstabe_unique` ON `hörspielTeil` (`hörspiel`,`buchstabe`);--> statement-breakpoint
CREATE TABLE `people_view` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`roles` text,
	`pseudonyms` text,
	`contributed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `person` (
	`name` text NOT NULL,
	`personID` integer PRIMARY KEY AUTOINCREMENT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `person_name_unique` ON `person` (`name`);--> statement-breakpoint
CREATE TABLE `pseudonym` (
	`name` text NOT NULL,
	`pseudonymID` integer PRIMARY KEY AUTOINCREMENT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pseudonym_name_unique` ON `pseudonym` (`name`);--> statement-breakpoint
CREATE TABLE `rolle` (
	`name` text NOT NULL,
	`rolleID` integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rolle_name_unique` ON `rolle` (`name`);--> statement-breakpoint
CREATE TABLE `hörspielSkriptautor` (
	`hörspielID` integer NOT NULL,
	`personID` integer NOT NULL,
	PRIMARY KEY(`hörspielID`, `personID`),
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`personID`) REFERENCES `person`(`personID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `serie` (
	`hörspielID` integer NOT NULL,
	`nummer` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `serie_hörspielID_unique` ON `serie` (`hörspielID`);--> statement-breakpoint
CREATE TABLE `kurzgeschichten` (
	`hörspielID` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sprechrolle` (
	`hörspielID` integer NOT NULL,
	`position` integer NOT NULL,
	`rolleID` integer NOT NULL,
	`sprechrolleID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`rolleID`) REFERENCES `rolle`(`rolleID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sprechrolle_hörspielID_rolleID_unique` ON `sprechrolle` (`hörspielID`,`rolleID`);--> statement-breakpoint
CREATE UNIQUE INDEX `sprechrolle_hörspielID_position_unique` ON `sprechrolle` (`hörspielID`,`position`);--> statement-breakpoint
CREATE TABLE `sprechrolleTeil` (
	`hörspielID` integer NOT NULL,
	`position` integer NOT NULL,
	`sprechrolleID` integer NOT NULL,
	PRIMARY KEY(`sprechrolleID`, `hörspielID`),
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`sprechrolleID`) REFERENCES `sprechrolle`(`sprechrolleID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sprechrolleTeil_hörspielID_position_unique` ON `sprechrolleTeil` (`hörspielID`,`position`);--> statement-breakpoint
CREATE TABLE `spricht` (
	`personID` integer NOT NULL,
	`position` integer NOT NULL,
	`pseudonymID` integer,
	`sprechrolleID` integer NOT NULL,
	PRIMARY KEY(`sprechrolleID`, `personID`),
	FOREIGN KEY (`personID`) REFERENCES `person`(`personID`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`pseudonymID`) REFERENCES `pseudonym`(`pseudonymID`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`sprechrolleID`) REFERENCES `sprechrolle`(`sprechrolleID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spricht_sprechrolleID_position_unique` ON `spricht` (`sprechrolleID`,`position`);--> statement-breakpoint
CREATE TABLE `spezial` (
	`hörspielID` integer PRIMARY KEY NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`hörspielID`) REFERENCES `hörspiel`(`hörspielID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spezial_position_unique` ON `spezial` (`position`);--> statement-breakpoint
CREATE TABLE `track` (
	`dauer` integer NOT NULL,
	`mediumID` integer NOT NULL,
	`position` integer NOT NULL,
	`titel` text NOT NULL,
	`trackID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	FOREIGN KEY (`mediumID`) REFERENCES `medium`(`mediumID`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `track_mediumID_position_unique` ON `track` (`mediumID`,`position`);--> statement-breakpoint
CREATE TABLE `version` (
	`date` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`major` integer NOT NULL,
	`minor` integer NOT NULL,
	`patch` integer NOT NULL
);
