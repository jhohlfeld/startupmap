# Meteor Vagrantfile

Usage:

````bash
$ vagrant up
$ vagrant ssh
````

Then, as soon as the vagrant machine has started and ssh'd into:

````bash
$[vagrant] sh /vagrant/scripts/bootstrap.sh
$[vagrant] sh /vagrant/scripts/create.sh <appname>
$[vagrant] cd $_
$[vagrant] meteor
````