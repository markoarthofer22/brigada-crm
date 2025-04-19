<?php

namespace PP\Classes;

use Exception;
use PDO;

/**
 * Database class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Database
{

	public static $connected = false;
	public static $dbh;

	/**
	 * PDODBConnect function
	 *
	 * @return PDO
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public static function PDODBConnect($db): PDO
	{

		$dbhost = $_ENV["DB_HOST"];
		$dbuser = $_ENV["DB_USER"];
		$dbpass = $_ENV["DB_PASS"];
		$dbname = $_ENV["DB_NAME"];
		$dbport = $_ENV["DB_PORT"] ?? 5432;

		try {
			$dbh = new PDO(
				"pgsql:host=$dbhost;dbname=$dbname;port=$dbport;sslmode=disable",
				$dbuser,
				$dbpass,
				[
					PDO::ATTR_PERSISTENT => true // <-- ADD THIS
				]
			);
		} catch (\PDOException $e) {
			throw new \PDOException($e->getMessage(), (int)$e->getCode());
		}

		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$dbh->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
		$dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
		// $dbh->exec("set names utf8");

		// Set schema to specific one, e.g., 'my_schema'
		// $schema = $_ENV["DB_SCHEMA"] ?? 'public';
		// $dbh->exec("SET search_path TO $schema");

		return $dbh;
	}

	/**
	 * Connection function
	 *
	 * @return PDO
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public static function Connection($db = null): PDO
	{
		if (!self::$connected) {
			self::$dbh = self::PDODBConnect($db);
		}
		return self::$dbh;
	}
}
