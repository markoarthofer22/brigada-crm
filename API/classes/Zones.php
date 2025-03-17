<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Zones class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Zones
{

	protected $database;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
	}

	/**
	 * GetAll function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(): array
	{
		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.zones z
				ORDER BY z.name ASC
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
			$result["coordinates"] = json_decode($result["coordinates"]);
		}
		return $results;
	}

	/**
	 * Get function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Get(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.zones z WHERE z.id_zones = :ID";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["data"] = json_decode($result["data"]);
			$result["coordinates"] = json_decode($result["coordinates"]);
		}

		return $result ?: [];
	}


	/**
	 * Add function
	 *
	 * @param object $params
	 * @return int
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Add(object $params): int
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.zones 
					(id_projects,id_images,name,coordinates,data) 
				VALUES 
					(:ID_PROJECTS,:ID_IMAGES,:NAME,:COORDINATES,:DATA)
				RETURNING id_zones
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_IMAGES', $params->id_images);
		$stmt->bindParam(':NAME', $params->name);
		$stmt->bindParam(':COORDINATES', json_encode($params->coordinates));
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return (int)$result['id_zones'];
	}

	/**
	 * Update function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Update(object $params): bool
	{

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.zones 
				SET 
					id_projects = :ID_PROJECTS,
					id_images = :ID_IMAGES,
					name = :NAME,
					coordinates = :COORDINATES,
					data = :DATA
				WHERE id_zones = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_IMAGES', $params->id_images);
		$stmt->bindParam(':NAME', $params->name);
		$stmt->bindParam(':COORDINATES', json_encode($params->coordinates));
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}


	/**
	 * Delete function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Delete(object $params): bool
	{
		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.zones 
				WHERE id_zones = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * GetForProject function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetForProject(object $params): array
	{
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.zones z WHERE z.id_projects = :ID ORDER BY z.name ASC";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as &$result) {
			if ($result) {
				$result["data"] = json_decode($result["data"]);
				$result["coordinates"] = json_decode($result["coordinates"]);
			}
		}

		return $results ?: [];
	}
}
