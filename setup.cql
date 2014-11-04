CREATE KEYSPACE so_tracker WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': '1'
};

USE so_tracker;

CREATE TABLE posts (
  questionid int,
  acceptedanswerid int,
  answercount int,
  createdate timestamp,
  datastax_close boolean,
  isanswered boolean,
  link text,
  owneracceptrate int,
  ownerdisplayname text,
  ownerlink text,
  ownerreputation int,
  owneruserid int,
  score int,
  tags set<text>,
  title text,
  view_count int,
  PRIMARY KEY ((questionid))
);
