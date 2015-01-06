cd /vagrant
meteor create $1
cd $1
mv .meteor/local/ ~/.meteor/local
ln -s ~/.meteor/local .meteor/local
