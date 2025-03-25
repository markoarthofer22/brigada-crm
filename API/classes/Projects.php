<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Projects class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Projects
{

	protected $database;
	protected $folder;

	/**
	 * __construct function
	 *
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function __construct(PDO $db)
	{
		$this->database = $db;
		$this->folder = "../files/projects";
	}

	/**
	 * GetAll function
	 *
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetAll(): array
	{

		$Helper = new Helper($this->database);

		$sql = "SELECT 
					* 
				FROM {$_SESSION["SCHEMA"]}.projects p
				ORDER BY p.name ASC
		";

		$stmt = $this->database->prepare($sql);
		$stmt->execute();

		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
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
		$sql = "SELECT * FROM {$_SESSION["SCHEMA"]}.projects p WHERE p.id_projects = :ID";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id, PDO::PARAM_INT);

		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result) {
			$result["data"] = json_decode($result["data"]);
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

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.projects
					(data)
				VALUES 
					(:DATA)
				RETURNING id_projects
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':DATA', json_encode($params->data));
		$stmt->execute();

		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return (int)$result['id_projects'];
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

		$sql = "UPDATE {$_SESSION["SCHEMA"]}.projects 
				SET 
					data = :DATA
				WHERE id_projects = :ID
		";

		$stmt = $this->database->prepare($sql);
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
		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.projects 
				WHERE id_projects = :ID
		";

		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $params->id);
		$stmt->execute();

		return true;
	}

	/**
	 * ConnectProjectsImages function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function ConnectProjectsImages(object $params): bool
	{

		$sql = "INSERT INTO {$_SESSION["SCHEMA"]}.projects_images (id_projects, id_images) VALUES (:ID_PROJECTS, :ID_IMAGES)";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_IMAGES', $params->id_images);
		$stmt->execute();

		return true;
	}

	/**
	 * DisconnectProjectsImages function
	 *
	 * @param object $params
	 * @return boolean
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function DisconnectProjectsImages(object $params): bool
	{

		$sql = "DELETE FROM {$_SESSION["SCHEMA"]}.projects_images WHERE id_projects = :ID_PROJECTS AND id_images = :ID_IMAGES";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id_projects);
		$stmt->bindParam(':ID_IMAGES', $params->id_images);
		$stmt->execute();

		return true;
	}

	/**
	 * GetImages function
	 *
	 * @param object $params
	 * @return array
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function GetImages(object $params): array
	{

		$sql = "SELECT 
					i.* 
				FROM {$_SESSION["SCHEMA"]}.projects_images pi
				LEFT JOIN {$_SESSION["SCHEMA"]}.images i ON pi.id_images = i.id_images
				WHERE pi.id_projects = :ID_PROJECTS
				ORDER BY i.name ASC
		";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_PROJECTS', $params->id);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as &$result) {
			$result["data"] = json_decode($result["data"]);
		}

		return $results;
	}
}
