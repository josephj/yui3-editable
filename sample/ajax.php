<?php
sleep(3);
$result = (rand(0, 1) === 1) ? "ok" : "fail";
echo "{\"response\": \"$result\"}";
?>
