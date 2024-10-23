CREATE TABLE `cliente` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text,
	`score` text,
	`nome` text
);
--> statement-breakpoint
CREATE TABLE `processo` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`estado` text,
	`tipoDeCredito` text,
	`deferido` text,
	`clienteId` integer NOT NULL,
	FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action
);
