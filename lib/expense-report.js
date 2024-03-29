const format = require('./format');

exports = module.exports = expenseReport;

exports.contentType = 'text/csv';
exports.extension = 'csv';
exports.encoding = 'utf8';

const types = init(
  [98, 161],
  'parking',
  init(
    [10, 25, 178, 179],
    'fuel',
    init(
      [9, 24, 27, 28, 30, 31, 32, 90, 139, 143, 156, 158, 159, 172],
      'meal',
      Object.create(null)
    )
  )
);

function init(arr, tp, r) {
  return arr.reduce((r, v) => {
    r[v] = tp;
    return r;
  }, r);
}
function prepare(line) {
  return line.map(function (item) {
    if (typeof item === 'number') {
      return '' + item;
    }
    if (typeof item === 'string') {
      // quote strings
      return '"' + item.replace(/"/g, '""') + '"';
    }
    // empty string for everything else
    return '';
  }).join(',') + '\n';
}

function getType({
  nights,
  sym
}) {
  if (nights) {
    return 'lodging';
  }
  return types[sym] || '';
}

function* expenseReport(options) {
  const {
    metadata: {
      currency,
      units,
      mileageRate,
      mode: tripMode
    },
    routes
  } = options;

  const header = [
    'Description',
    'Date',
    'Amount',
    'Currency',
    'Type',
    'Notes'
  ];

  const steps = routes[0].points;
  let from;

  function getLines(i) {
    const {
      address,
      arrival_time,
      cost,
      costRoute,
      day,
      dayLabel,
      distance,
      mode,
      name,
      nights,
      notes,
      per_diem,
      tags
    } = steps[i];
    const to = name || address;
    const date = format.date(new Date(arrival_time));
    const inTripMode = mode === undefined || mode === tripMode;
    const lines = [];

    if (mileageRate && distance && inTripMode) {
      const line = [];

      line.push(format.description(
        [from, to].join(' - '),
        dayLabel,
        format.distance(distance, 1, units, true),
        format.amount(mileageRate / 100, 3, currency)
      ));
      line.push(date);
      line.push(format.distance(distance * mileageRate / 100, 2, units));
      line.push(currency);
      line.push('mileage');

      lines.push(prepare(line));
    }
    if (costRoute) {
      const line = [];

      line.push(format.description([from, to].join(' - '), dayLabel));
      line.push(date);
      line.push(format.amount(costRoute / 100, 2));
      line.push(currency);
      line.push(inTripMode ? 'tolls' : 'transportation');

      lines.push(prepare(line));
    }
    if (cost) {
      const line = [];

      line.push(format.description(name || address, tags, dayLabel,
        nights > 1 &&
        [
          format.amount(cost / 100, 2, currency),
          `${day + 1}/${nights}`
        ]));
      line.push(date);
      line.push(format.amount(cost / (nights || 1) / 100, 2));
      line.push(currency);
      line.push(getType(steps[i]));
      line.push(notes);

      lines.push(prepare(line));
    }
    if (per_diem) {
      const line = [];

      line.push(format.description(address || name, tags, dayLabel));
      line.push(date);
      line.push(format.amount(per_diem / 100, 2));
      line.push(currency);
      line.push('per diem');
      line.push(notes);

      lines.push(prepare(line));
    }

    from = to;
    return lines;
  }

  yield prepare(header);
  for (let i = 0; i < steps.length; i += 1) {
    const lines = getLines(i);
    for (let j = 0; j < lines.length; j += 1) {
      yield lines[j];
    }
  }
}
