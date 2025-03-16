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
	 * Upload base64-encoded image to specified folder with random filename.
	 *
	 * @param string $image base64 encoded image
	 * @return string Filename of saved image
	 * @throws Exception if any error occurs during upload
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function UploadImage(string $image): string
	{
		// Verify and create folder if it doesn't exist
		if (!is_dir($this->folder)) {
			if (!mkdir($this->folder, 0777, true)) {
				throw new Exception("Failed to create directory.");
			}
		}

		// Set correct permissions
		chmod($this->folder, 0777);

		// Extract base64 data
		if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
			$image = substr($image, strpos($image, ',') + 1);
			$type = strtolower($type[1]); // jpg, png, gif, etc.

			if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
				throw new Exception("Unsupported file type.");
			}
		} else {
			throw new Exception("Invalid base64 format.");
		}

		// Decode base64
		$image = base64_decode($image);

		if ($image === false) {
			throw new Exception("Decoding failed.");
		}

		// Generate random filename
		$fileName = uniqid('', true) . '.' . $type;

		// Save file
		$filePath = rtrim($this->folder, '/') . '/' . $fileName;

		if (file_put_contents($filePath, $image) === false) {
			throw new Exception("Saving failed.");
		}

		return $fileName;
	}

	/**
	 * Delete image from specified folder.
	 *
	 * @param int $id ID of project
	 * @return boolean True if image was deleted, false if it didn't exist or couldn't be deleted
	 * @throws Exception if any error occurs during deletion
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 * @return boolean
	 */

	public function DeleteImage(int $id): bool
	{
		$sql = "SELECT image FROM {$_SESSION['SCHEMA']}.projects WHERE id_projects = :ID";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID', $id);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result && $result["image"]) {
			$filePath = rtrim($this->folder, '/') . '/' . $result["image"];
			if (file_exists($filePath)) {
				if (!unlink($filePath)) {
					throw new Exception("Failed to delete image.");
				}
			}
		}

		return true;
	}
}
