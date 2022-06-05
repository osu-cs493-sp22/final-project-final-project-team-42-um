import random
subjects = ['CS', 'Math', 'Physics', 'History']
terms = ['Fall', 'Spring', 'Winter', 'Summer']
level = ['1', '2', '3', '4']
series = ['11', '12', '13', '21', '22', '23', '41', '42', '44']

instructor = '"629c48745be470a84d322497"'

file = open('courses.json', 'w+')
file.write('[\n')
for i in range(24):
    file.write('\t{\n')
    file.write('\t\t"subject": "' + random.choice(subjects) + '",\n')
    file.write('\t\t"number": "' + random.choice(level) + random.choice(series) + '",\n')
    file.write('\t\t"title": "Course ' + str(i + 1) + '",\n')
    file.write('\t\t"term": "' + random.choice(terms) + '",\n')
    file.write('\t\t"instructorId": ' + instructor + '\n')
    file.write('\t},\n')
file.write('\t{\n')
file.write('\t\t"subject": "' + random.choice(subjects) + '",\n')
file.write('\t\t"number": "' + random.choice(level) + random.choice(series) + '",\n')
file.write('\t\t"title": "Course ' + str(25) + '",\n')
file.write('\t\t"term": "' + random.choice(terms) + '",\n')
file.write('\t\t"instructorId": ' + instructor + '\n')
file.write('\t}\n')
file.write(']')
file.close()
