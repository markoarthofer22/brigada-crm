<?php

namespace PP\Classes;

use Exception;
use PDO;
use stdClass;

/**
 * Images class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Images
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
	 * Upload image to specified folder with random filename.
	 *
	 * @param array $image
	 * @return array 
	 * @throws Exception if any error occurs during upload
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Upload(array $image): array
	{
		// Verify and create folder if it doesn't exist
		if (!is_dir($this->folder)) {
			if (!mkdir($this->folder, 0777, true)) {
				throw new Exception("Failed to create directory.");
			}
		}
		chmod($this->folder, 0777);

		// Generate random filename
		$fileExtension = pathinfo($image["file_name"], PATHINFO_EXTENSION);
		$fileName = uniqid('', true) . '.' . $fileExtension;

		$filePath = rtrim($this->folder, '/') . '/' . $fileName;
		move_uploaded_file($image["temp_file"], $filePath);

		$sql = "INSERT INTO {$_SESSION['SCHEMA']}.images (name) VALUES (:NAME) RETURNING id_images";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':NAME', $fileName, PDO::PARAM_STR);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		return array("name" => $fileName, "id_images" => (int)$result['id_images']);
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

	public function Delete(int $id): bool
	{
		$sql = "SELECT name FROM {$_SESSION['SCHEMA']}.images i WHERE i.id_images = :ID_IMAGES";
		$stmt = $this->database->prepare($sql);
		$stmt->bindParam(':ID_IMAGES', $id);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if ($result["name"]) {
			unlink($this->folder . "/" . $result["name"]);
			$this->database->prepare("DELETE FROM {$_SESSION['SCHEMA']}.images i WHERE i.id_images = {$id}")->execute();
			$this->database->prepare("DELETE FROM {$_SESSION['SCHEMA']}.zones z WHERE z.id_images = {$id}")->execute();
		}

		return true;
	}
}
