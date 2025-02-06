# Volumes Test Script

Using:

```
torrentbox (i-08fec1692931e31e7)
{"volumeId":"vol-0582d7fc0f3d797fc","device":"/dev/xvda"},
{"volumeId":"vol-0987a9ce9bb4c7b1d","device":"/dev/xvdf"}
```

These are the commands, roughly:

```bash
//  detach...
aws ec2 detach-volume --volume-id vol-0582d7fc0f3d797fc >> ./src/fixtures/volumes-detach-volume1.json
aws ec2 detach-volume --volume-id vol-0987a9ce9bb4c7b1d >> ./src/fixtures/volumes-detach-volume2.json

//  snapshot...
aws ec2 create-snapshot --volume-id vol-0582d7fc0f3d797fc >> ./src/fixtures/create-snaphshot-volume1.json
aws ec2 create-snapshot --volume-id vol-0987a9ce9bb4c7b1d >> ./src/fixtures/create-snaphshot-volume2.json

# create tags from snapshot details:
aws ec2 create-tags --resources i-08fec1692931e31e7 --tags 'Key="boxes.volumesnapshots",Value="[{\"snapshotId\":\"snap-03c3efc7e9254ab0a\",\"device\":\"/dev/xvda\"},{\"snapshotId\":\"snap-056afd3da4b3b003b\",\"device\":\"/dev/xvdf\"}]"'


//  delete - no response needs to be recorded for fixtures.
aws ec2 delete-volume --volume-id vol-0582d7fc0f3d797fc
aws ec2 delete-volume --volume-id vol-0987a9ce9bb4c7b1d

//  Create volumes from snapshots.

# Get the EC2 instance details - we need the tags and its availability zone.
aws ec2 describe-instances --instance-ids i-08fec1692931e31e7 >> ./src/fixtures/volumes-describe-instances.json

aws ec2 create-volume --snapshot-id "snap-0f87e8940e82b46ce" --availability-zone us-west-2a > ./src/fixtures/volumes-create-volume1.json
aws ec2 create-volume --snapshot-id "snap-0d4180edffe7ecdbc" --availability-zone us-west-2a > ./src/fixtures/volumes-create-volume2.json

aws ec2 attach-volume --volume-id vol-0c3940cade857692b --instance-id i-08fec1692931e31e7 --device '/dev/xvdf' > ./src/fixtures/volumes-attach-volume1.json
aws ec2 attach-volume --volume-id vol-059b4ea55caf83199 --instance-id i-08fec1692931e31e7 --device '/dev/xvda' > ./src/fixtures/volumes-attach-volume2.json

```
